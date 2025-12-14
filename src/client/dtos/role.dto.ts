import { ResourceAuthorizations } from "../../shared";

export type IClientRole = {
  id: string;
  name: string;
  permissions: ResourceAuthorizations[];
}