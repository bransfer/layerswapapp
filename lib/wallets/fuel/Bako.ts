import { urlJoin } from "@fuel-ts/account";

export class BAKO_STATE {
    static state: { last_req?: Date, data: boolean, req_count: number, period_start?: Date } = { data: false, req_count: 0 }
    static period_durtion: number = 10_000
}

export class BaskoRequestAPI {
    baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async get(pathname: string) {

        if (!pathname.includes('/state')) {
            const data = await fetch(urlJoin(this.baseUrl, pathname)).then((res) =>
                res.json(),
            );
            return data;
        }

        const period_elapsed = BAKO_STATE.state?.period_start && new Date().getTime() - BAKO_STATE.state?.period_start?.getTime() > BAKO_STATE.period_durtion;
        const skip = BAKO_STATE.state?.last_req && new Date().getTime() - BAKO_STATE.state?.last_req?.getTime() < 1000 * 60 * 2 && period_elapsed;

        if (skip)
            return BAKO_STATE.state?.data;

        const data = await fetch(urlJoin(this.baseUrl, pathname)).then((res) =>
            res.json(),
        );
        const count = BAKO_STATE.state?.req_count || 0;
        BAKO_STATE.state = { last_req: new Date(), data, req_count: count + 1, period_start: period_elapsed ? new Date() : BAKO_STATE.state?.period_start || new Date() };
        return data;
    }

    async delete(pathname: string) {
        await fetch(urlJoin(this.baseUrl, pathname), {
            method: 'DELETE',
        });
    }
}