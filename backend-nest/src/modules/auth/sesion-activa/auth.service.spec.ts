import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';  
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('testToken'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate user credentials', async () => {
    const user = await service.validateUser('user1', 'pass1');
    expect(user).toBeDefined();
    expect(user.username).toBe('user1');
  });

  it('should throw UnauthorizedException for invalid credentials', async () => {
    await expect(service.validateUser('user1', 'wrongPass')).rejects.toThrow('Credenciales inválidas');
  });

  it('should login and return a token', async () => {
    const user = { userId: '1', username: 'user1' };
    const result = await service.login(user, 'userAgent1');
    expect(result.access_token).toBe('testToken');
  });

  it('should validate token', async () => {
    const isValid = await service.validateToken('1', 'testToken');
    expect(isValid).toBe(true);
  });

  it('should throw UnauthorizedException for invalid token', async () => {
    await expect(service.validateToken('1', 'invalidToken')).rejects.toThrow('Token');
  });

  it('should logout user', async () => {
    await service.logout('1');
    const user = await usersService.findById('1');
    expect(user.token).toBeNull();
    expect(user.userAgent).toBeNull();
  });
});