export default class AppSettings {
    static LayerswapBridgeApiUri?: string = process.env.NEXT_PUBLIC_LS_BRIDGE_API;
    static LayerswapApiUri?: string = process.env.NEXT_PUBLIC_LS_API
    static ExplorerURl: string = `https://www.layerswap.io/explorer/`
    static ApiVersion?: string = process.env.NEXT_PUBLIC_API_VERSION
    static ImageStorage?: string = process.env.NEXT_PUBLIC_IMAGE_STORAGE
}