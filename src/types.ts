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

// // https://stackoverflow.com/a/52991061/206879
// type RequiredKeys<T> = {
//   [K in keyof T]-?: string extends K
//     ? never
//     : number extends K
//     ? never
//     : {} extends Pick<T, K>
//     ? never
//     : K;
// } extends { [_ in keyof T]-?: infer U }
//   ? U extends keyof T
//     ? U
//     : never
//   : never;

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

  // Using route string as first parameter

  /**
   * Paginate a request using a known endpoint route string and map each response to a custom array
   *
   * @param {string} route Request method + URL. Example: `'GET /orgs/:org'`
   * @param {function} mapFn Optional method to map each response to a custom array
   */
  <R extends keyof OctokitTypes.Endpoints, MR extends unknown[]>(
    route: R,
    mapFn: (
      response: OctokitTypes.Endpoints[R]["response"],
      done: () => void
    ) => MR
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
  <T, R extends OctokitTypes.Route = OctokitTypes.Route>(
    route: R,
    parameters?: R extends keyof OctokitTypes.Endpoints
      ? OctokitTypes.Endpoints[R]["parameters"]
      : OctokitTypes.RequestParameters
  ): Promise<T[]>;

  //  Using request method as first parameter

  /**
   * Paginate a request using an endpoint method and a map function
   *
   * @param {string} request Request method (`octokit.request` or `@octokit/request`)
   * @param {function} mapFn? Optional method to map each response to a custom array
   */
  <R extends OctokitTypes.RequestInterface, MR extends unknown[]>(
    request: R,
    mapFn: (
      response: GetResponseTypeFromEndpointMethod<R>,
      done: () => void
    ) => MR
  ): Promise<MR>;

  /**
   * Paginate a request using an endpoint method, parameters, and a map function
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
   * Paginate a request using an endpoint method and parameters
   *
   * @param {string} request Request method (`octokit.request` or `@octokit/request`)
   * @param {object} parameters? URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
   */
  <R extends OctokitTypes.RequestInterface>(
    request: R,
    parameters?: Parameters<R>[0]
  ): Promise<GetResponseDataTypeFromEndpointMethod<R>>;

  iterator: {
    // Using object as first parameter

    /**
     * Get an async iterator to paginate a request using endpoint options
     *
     * @see {link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of} for await...of
     * @param {object} endpoint Must set `method` and `url`. Plus URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
     */
    <T>(EndpointOptions: OctokitTypes.EndpointOptions): AsyncIterableIterator<
      OctokitTypes.OctokitResponse<PaginationResults<T>>
    >;

    // Using route string as first parameter

    /**
     * Get an async iterator to paginate a request using a known endpoint route string and optional parameters
     *
     * @see {link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of} for await...of
     * @param {string} route Request method + URL. Example: `'GET /orgs/:org'`
     * @param {object} [parameters] URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
     */
    <R extends keyof OctokitTypes.Endpoints>(
      route: R,
      parameters?: OctokitTypes.Endpoints[R]["parameters"]
    ): AsyncIterableIterator<
      OctokitTypes.OctokitResponse<
        OctokitTypes.Endpoints[R]["response"]["data"]
      >
    >;

    /**
     * Get an async iterator to paginate a request using an unknown endpoint route string and optional parameters
     *
     * @see {link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of} for await...of
     * @param {string} route Request method + URL. Example: `'GET /orgs/:org'`
     * @param {object} [parameters] URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
     */
    <T, R extends OctokitTypes.Route = OctokitTypes.Route>(
      route: R,
      parameters?: R extends keyof OctokitTypes.Endpoints
        ? OctokitTypes.Endpoints[R]["parameters"]
        : OctokitTypes.RequestParameters
    ): AsyncIterableIterator<
      OctokitTypes.OctokitResponse<PaginationResults<T>>
    >;

    // Using request method as first parameter

    /**
     * Get an async iterator to paginate a request using a request method and optional parameters
     *
     * @see {link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of} for await...of
     * @param {string} request `@octokit/request` or `octokit.request` method
     * @param {object} [parameters] URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
     */
    <R extends OctokitTypes.RequestInterface>(
      request: R,
      parameters?: Parameters<R>[0]
    ): AsyncIterableIterator<
      OctokitTypes.OctokitResponse<GetResponseDataTypeFromEndpointMethod<R>>
    >;
  };
}
