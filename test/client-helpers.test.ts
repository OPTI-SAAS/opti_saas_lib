import { getAuthorizationsOfResource } from '../src/client/helpers';

describe('getAuthorizationsOfResource', () => {
  it('should return authorizations for FACTURE resource', () => {
    const result = getAuthorizationsOfResource('USERS');
    expect(result).toEqual([
      'USERS_CREATE',
      'USERS_READ',
      'USERS_UPDATE',
      'USERS_DELETE',
    ]);
  });

  it('should return authorizations for AVOIR resource', () => {
    const result = getAuthorizationsOfResource('REGULATIONS');
    expect(result).toEqual(['REGULATIONS_UPDATE', 'REGULATIONS_DELETE']);
  });
});
