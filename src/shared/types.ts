import {
  Resource,
  RESOURCE_AUTHORISATION_MAP,
} from "./config";

export type OptionsOfArray<T> = T extends readonly (infer U)[] ? U : never;

export type AuthorizationsInResource<T extends Resource> =
  T extends Resource
    ? (typeof RESOURCE_AUTHORISATION_MAP)[T]
    : never;

export type AuthorizationsPerResource<
  T extends Resource
> = AuthorizationsInResource<T>[number];

export type ResourceAuthorizations = {
  [R in Resource]: `${R}_${AuthorizationsPerResource<R>}`;
}[Resource];
