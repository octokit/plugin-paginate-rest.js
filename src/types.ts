import * as OctokitTypes from "@octokit/types";

export {
  EndpointOptions,
  RequestInterface,
  OctokitResponse,
  RequestParameters,
  Route,
} from "@octokit/types";

export interface PaginateInterface {
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

  /**
   * Paginate a request using an endpoint route string and map each response to a custom array
   *
   * @param {string} route Request method + URL. Example: `'GET /orgs/:org'`
   * @param {function} mapFn Optional method to map each response to a custom array
   */
  <T, R>(route: OctokitTypes.Route, mapFn: MapFunction<T>): Promise<
    PaginationResults<R>
  >;

  /**
   * Paginate a request using an endpoint route string and parameters, and map each response to a custom array
   *
   * @param {string} route Request method + URL. Example: `'GET /orgs/:org'`
   * @param {object} parameters URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
   * @param {function} mapFn Optional method to map each response to a custom array
   */
  <T, R>(
    route: OctokitTypes.Route,
    parameters: OctokitTypes.RequestParameters,
    mapFn: MapFunction<T>
  ): Promise<PaginationResults<R>>;

  /**
   * Paginate a request using an endpoint route string and parameters
   *
   * @param {string} route Request method + URL. Example: `'GET /orgs/:org'`
   * @param {object} parameters URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
   */
  <T>(
    route: OctokitTypes.Route,
    parameters: OctokitTypes.RequestParameters
  ): Promise<PaginationResults<T>>;

  /**
   * Paginate a request using an endpoint route string
   *
   * @param {string} route Request method + URL. Example: `'GET /orgs/:org'`
   */
  <T>(route: OctokitTypes.Route): Promise<PaginationResults<T>>;

  /**
   * Paginate a request using an endpoint route string and parameters
   *
   * @param {string} request Request method (`octokit.request` or `@octokit/request`)
   * @param {object} parameters URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
   * @param {function} mapFn Optional method to map each response to a custom array
   */
  <T, R>(
    request: OctokitTypes.RequestInterface,
    parameters: OctokitTypes.RequestParameters,
    mapFn: MapFunction<T>
  ): Promise<PaginationResults<R>>;

  /**
   * Paginate a request using an endpoint route string and parameters
   *
   * @param {string} request Request method (`octokit.request` or `@octokit/request`)
   * @param {object} parameters URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
   */
  <T>(
    request: OctokitTypes.RequestInterface,
    parameters: OctokitTypes.RequestParameters
  ): Promise<PaginationResults<T>>;

  /**
   * Paginate a request using an endpoint function
   *
   * @param {function} request `octokit.endpoint` or `@octokit/endpoint` compatible method
   */
  <T>(request: OctokitTypes.RequestInterface): Promise<PaginationResults<T>>;

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
