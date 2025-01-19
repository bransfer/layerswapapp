import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // const slug = req.query.slug && (req.query.slug as string[]).join('/');

    // const queryParams = {}
    // for(const key in req.query) {
    //     if(key !== 'slug') {
    //         queryParams[key] = req.query[key]
    //     }
    // }

    // const searchParams = new URLSearchParams(queryParams);

    const checkpoint = (await axios.get('https://sync-sepolia.beaconcha.in/checkpointz/v1/status')).data

    if (!checkpoint) {
        res.status(400).json({ error: { message: "Failed" } })
        return
    } else if (checkpoint) {
        res.status(200).json(checkpoint)
        return
    }

    else {
        res.status(500)
    }
}

