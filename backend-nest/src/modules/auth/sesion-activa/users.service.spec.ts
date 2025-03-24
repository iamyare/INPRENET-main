import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find a user by username', async () => {
    const user = await service.findOne('user1');
    expect(user).toBeDefined();
    expect(user.username).toBe('user1');
  });

  it('should find a user by userId', async () => {
    const user = await service.findById('1');
    expect(user).toBeDefined();
    expect(user.userId).toBe('1');
  });

  it('should update user token and userAgent', async () => {
    await service.updateUserToken('1', 'newToken', 'newUserAgent');
    const user = await service.findById('1');
    expect(user.token).toBe('newToken');
    expect(user.userAgent).toBe('newUserAgent');
  });
});