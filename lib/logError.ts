import { datadogRum } from "@datadog/browser-rum";

const logError = (message: string) => {
    const error = new Error(message + ` env: ${process.env.NEXT_PUBLIC_API_VERSION ?? 'prod'}`)
    error.name = 'AlertUI';
    error.cause = error;
    datadogRum.addError(error);
}

export default logError;