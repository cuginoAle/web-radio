/**
 * - network: no connection, DNS failure or timeout
 * - server: the mirror answered with an HTTP error
 * - invalid: the mirror answered something that is not the expected JSON
 * - aborted: the user cancelled
 */
export type DirectoryErrorKind = 'network' | 'server' | 'invalid' | 'aborted';

export class DirectoryError extends Error {
  constructor(
    readonly kind: DirectoryErrorKind,
    message: string,
    readonly transient = false,
  ) {
    super(message);
    this.name = 'DirectoryError';
  }
}
