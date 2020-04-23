import * as OctokitTypes from "@octokit/types";
import {
  GetResponseTypeFromEndpointMethod,
  GetResponseDataTypeFromEndpointMethod,
} from "@octokit/types";

export {
  EndpointOptions,
  RequestInterface,
  OctokitResponse,
  RequestParameters,
  Route,
} from "@octokit/types";

// https://stackoverflow.com/a/52991061/206879
type RequiredKeys<T> = {
  [K in keyof T]-?: string extends K
    ? never
    : number extends K
    ? never
    : {} extends Pick<T, K>
    ? never
    : K;
} extends { [_ in keyof T]-?: infer U }
  ? U extends keyof T
    ? U
    : never
  : never;

export interface MapFunction<T = unknown, R = unknown> {
  (
    response: OctokitTypes.OctokitResponse<PaginationResults<T>>,
    done: () => void
  ): R[];
}

export type PaginationResults<T = unknown> = T[];

export interface PaginateInterface {
  // Using object as first parameter

  /**
   * Paginate a request using endpoint options and map each response to a custom array
   *
   * @param {object} endpoint Must set `method` and `url`. Plus URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
   * @param {function} mapFn Optional method to map each response to a custom array
   */
  <T, R>(
    options: OctokitTypes.EndpointOptions,
    mapFn: MapFunction<T, R>
  ): Promise<PaginationResults<R>>;

  /**
   * Paginate a request using endpoint options
   *
   * @param {object} endpoint Must set `method` and `url`. Plus URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
   */
  <T>(options: OctokitTypes.EndpointOptions): Promise<PaginationResults<T>>;

  // Using string as first parameter

  /**
   * Paginate a request using a known endpoint route string and map each response to a custom array
   *
   * @param {string} route Request method + URL. Example: `'GET /orgs/:org'`
   * @param {function} mapFn Optional method to map each response to a custom array
   */
  <R extends keyof OctokitTypes.Endpoints, MR extends unknown[]>(
    route: R,
    mapFn: RequiredKeys<OctokitTypes.Endpoints[R]["parameters"]> extends never
      ? (
          response: OctokitTypes.Endpoints[R]["response"],
          done: () => void
        ) => MR
      : never // endpoint has required parameters
  ): Promise<MR>;

  /**
   * Paginate a request using a known endpoint route string and parameters, and map each response to a custom array
   *
   * @param {string} route Request method + URL. Example: `'GET /orgs/:org'`
   * @param {object} parameters URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
   * @param {function} mapFn Optional method to map each response to a custom array
   */
  <R extends keyof OctokitTypes.Endpoints, MR extends unknown[]>(
    route: R,
    parameters: OctokitTypes.Endpoints[R]["parameters"],
    mapFn: (
      response: OctokitTypes.Endpoints[R]["response"],
      done: () => void
    ) => MR
  ): Promise<MR>;

  /**
   * Paginate a request using an known endpoint route string
   *
   * @param {string} route Request method + URL. Example: `'GET /orgs/:org'`
   * @param {object} parameters? URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
   */
  <R extends keyof OctokitTypes.Endpoints>(
    route: R,
    parameters?: OctokitTypes.Endpoints[R]["parameters"]
  ): Promise<OctokitTypes.Endpoints[R]["response"]["data"]>;

  // I tried this version which would make the `parameters` argument required if the route has required parameters
  // but it caused some weird errors
  // <R extends keyof OctokitTypes.Endpoints>(
  //   route: R,
  //   ...args: RequiredKeys<OctokitTypes.Endpoints[R]["parameters"]> extends never
  //     ? [OctokitTypes.Endpoints[R]["parameters"]?]
  //     : [OctokitTypes.Endpoints[R]["parameters"]]
  // ): Promise<OctokitTypes.Endpoints[R]["response"]["data"]>;

  /**
   * Paginate a request using an unknown endpoint route string
   *
   * @param {string} route Request method + URL. Example: `'GET /orgs/:org'`
   * @param {object} parameters? URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
   */
  <T>(
    route: OctokitTypes.Route,
    parameters?: OctokitTypes.RequestParameters
  ): Promise<T[]>;

  //  Using request method as first parameter

  /**
   * Paginate a request using an endpoint route string and parameters
   *
   * @param {string} request Request method (`octokit.request` or `@octokit/request`)
   * @param {function} mapFn? Optional method to map each response to a custom array
   */
  <R extends OctokitTypes.RequestInterface, MR extends unknown[]>(
    request: R,
    mapFn: RequiredKeys<Parameters<R>[0]> extends never
      ? (response: GetResponseTypeFromEndpointMethod<R>, done: () => void) => MR
      : never // endpoint has required parameters
  ): Promise<MR>;

  /**
   * Paginate a request using an endpoint route string and parameters
   *
   * @param {string} request Request method (`octokit.request` or `@octokit/request`)
   * @param {object} parameters URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
   * @param {function} mapFn? Optional method to map each response to a custom array
   */
  <R extends OctokitTypes.RequestInterface, MR extends unknown[]>(
    request: R,
    parameters: Parameters<R>[0],
    mapFn: (
      response: GetResponseTypeFromEndpointMethod<R>,
      done?: () => void
    ) => MR
  ): Promise<MR>;

  /**
   * Paginate a request using an endpoint route string and parameters
   *
   * @param {string} request Request method (`octokit.request` or `@octokit/request`)
   * @param {object} parameters? URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
   */
  <R extends OctokitTypes.RequestInterface>(
    request: R,
    ...args: RequiredKeys<Parameters<R>[0]> extends never
      ? [Parameters<R>[0]?]
      : [Parameters<R>[0]]
  ): Promise<GetResponseDataTypeFromEndpointMethod<R>>;

  iterator: {
    /**
     * Get an async iterator to paginate a request using endpoint options
     *
     * @see {link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of} for await...of
     * @param {object} endpoint Must set `method` and `url`. Plus URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
     */
    <T>(EndpointOptions: OctokitTypes.EndpointOptions): AsyncIterableIterator<
      OctokitTypes.OctokitResponse<PaginationResults<T>>
    >;

    /**
     * Get an async iterator to paginate a request using an endpoint route string and optional parameters
     *
     * @see {link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of} for await...of
     * @param {string} route Request method + URL. Example: `'GET /orgs/:org'`
     * @param {object} [parameters] URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
     */
    <T>(
      route: OctokitTypes.Route,
      parameters?: OctokitTypes.RequestParameters
    ): AsyncIterableIterator<
      OctokitTypes.OctokitResponse<PaginationResults<T>>
    >;

    /**
     * Get an async iterator to paginate a request using a request method and optional parameters
     *
     * @see {link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of} for await...of
     * @param {string} request `@octokit/request` or `octokit.request` method
     * @param {object} [parameters] URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
     */
    <T>(
      request: OctokitTypes.RequestInterface,
      parameters?: OctokitTypes.RequestParameters
    ): AsyncIterableIterator<
      OctokitTypes.OctokitResponse<PaginationResults<T>>
    >;
  };
}
