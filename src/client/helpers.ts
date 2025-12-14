import { AuthorizationsInResource, AuthorizationsPerResource, Resource, RESOURCE_AUTHORISATION_MAP } from "../shared";



export const getAuthorizationsOfResource = <T extends Resource>(
  resource: T
): Array<`${T}_${AuthorizationsPerResource<T>}`> => {
  const authorizations = RESOURCE_AUTHORISATION_MAP[
    resource
  ] as AuthorizationsInResource<T>;
  return authorizations.map((auth) => `${resource}_${auth}` as `${T}_${AuthorizationsPerResource<T>}`);
};


