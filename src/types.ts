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

  // /**
  //  * Paginate a request using an endpoint route string and map each response to a custom array
  //  *
  //  * @param {string} route Request method + URL. Example: `'GET /orgs/:org'`
  //  * @param {function} mapFn Optional method to map each response to a custom array
  //  */
  // <T, R>(route: OctokitTypes.Route, mapFn: MapFunction<T>): Promise<
  //   PaginationResults<R>
  // >;

  // /**
  //  * Paginate a request using an endpoint route string and parameters, and map each response to a custom array
  //  *
  //  * @param {string} route Request method + URL. Example: `'GET /orgs/:org'`
  //  * @param {object} parameters URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
  //  * @param {function} mapFn Optional method to map each response to a custom array
  //  */
  // <T, R>(
  //   route: OctokitTypes.Route,
  //   parameters: OctokitTypes.RequestParameters,
  //   mapFn: MapFunction<T>
  // ): Promise<PaginationResults<R>>;

  // /**
  //  * Paginate a request using an endpoint route string and parameters
  //  *
  //  * @param {string} route Request method + URL. Example: `'GET /orgs/:org'`
  //  * @param {object} parameters URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
  //  */
  // <T>(
  //   route: OctokitTypes.Route,
  //   parameters: OctokitTypes.RequestParameters
  // ): Promise<PaginationResults<T>>;

  /**
   * Paginate a request using an endpoint route string
   *
   * @param {string} route Request method + URL. Example: `'GET /orgs/:org'`
   */
  <
    R extends OctokitTypes.Route,
    P extends OctokitTypes.RequestParameters = R extends keyof OctokitTypes.Endpoints
      ? OctokitTypes.Endpoints[R]["parameters"] & OctokitTypes.RequestParameters
      : OctokitTypes.RequestParameters
  >(
    route: keyof OctokitTypes.Endpoints | R
  ): Promise<
    R extends keyof OctokitTypes.Endpoints
      ? OctokitTypes.Endpoints[R]["response"]["data"]
      : unknown[]
  >;
  // ): Promise<PaginationResults<T>>;

  //   <
  //   R extends Route,
  //   P extends RequestParameters = R extends keyof Endpoints
  //     ? Endpoints[R]["parameters"] & RequestParameters
  //     : RequestParameters
  // >(
  //   route: keyof Endpoints | R,
  //   parameters?: P
  // ): (R extends keyof Endpoints ? Endpoints[R]["request"] : RequestOptions) &
  //   Pick<P, keyof RequestOptions>;

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
      ? (response: GetResponseTypeFromEndpointMethod<R>) => MR
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
    mapFn: (response: GetResponseTypeFromEndpointMethod<R>) => MR
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

export interface MapFunction<T = any, R = any> {
  (
    response: OctokitTypes.OctokitResponse<PaginationResults<T>>,
    done: () => void
  ): R[];
}

export type PaginationResults<T = any> = T[];
