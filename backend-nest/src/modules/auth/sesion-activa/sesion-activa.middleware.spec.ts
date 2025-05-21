import { SesionActivaMiddleware } from './sesion-activa.middleware';
import { Repository } from 'typeorm';
import { Sesion } from '../entities'; // Assuming Sesion is exported from entities/index.ts

describe('SesionActivaMiddleware', () => {
  let middleware: SesionActivaMiddleware;
  let mockSesionRepository: Partial<Repository<Sesion>>;

  beforeEach(() => {
    // Initialize mockSesionRepository with any methods that might be called by the middleware
    // For a simple 'toBeDefined' test, it might not need any specific methods mocked.
    mockSesionRepository = {
      // findOne: jest.fn(), // Example if findOne is used
    };
    middleware = new SesionActivaMiddleware(mockSesionRepository as Repository<Sesion>);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });
});
