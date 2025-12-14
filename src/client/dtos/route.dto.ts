import { ResourceAuthorizations } from "../../shared";

export type RouteTypes = "link" | "collapse" | "sous-collapse" | "collapse-link";

export type IClientRoute = {
  id: string;
  label: string;
} & (
  | {
      type: "link";
      children?: never;
      icon?: never;
      path: string;
      authorizations_needed: ResourceAuthorizations[];
    }
  | {
      type: "collapse-link";
      children?: never;
      path: string;
      icon?: never;
      authorizations_needed: ResourceAuthorizations[];
    }
  | {
      type: "collapse" | "sous-collapse";
      children: IClientRoute[];
      icon: string;
      path?: never;
    }
);
