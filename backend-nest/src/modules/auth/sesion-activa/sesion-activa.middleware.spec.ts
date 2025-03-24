import { SesionActivaMiddleware } from './sesion-activa.middleware';

describe('SesionActivaMiddleware', () => {
  it('should be defined', () => {
    expect(new SesionActivaMiddleware()).toBeDefined();
  });
});
