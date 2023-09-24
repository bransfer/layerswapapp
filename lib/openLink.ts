import { QueryParams } from "../Models/QueryParams";
import { SwapFormValues } from "../components/DTOs/SwapFormValues";

const mobileRE = /(android|bb\d+|meego).+mobile|armv7l|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series[46]0|samsungbrowser|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i
const notMobileRE = /CrOS/

const tabletRE = /android|ipad|playbook|silk/i

export const TEMP_DATA_ITEM_NAME = "link_temp_data"

export const getTempData = (): LinkTempData => JSON.parse(sessionStorage.getItem(TEMP_DATA_ITEM_NAME) || "null")
const setTempData = (data: LinkTempData) => sessionStorage.setItem(TEMP_DATA_ITEM_NAME, JSON.stringify(data))
export const clearTempData = () => sessionStorage.setItem(TEMP_DATA_ITEM_NAME, null)

type OpenLinkArgs = {
  addressSource?: string;
  link: string;
  query: QueryParams;
  swapId: string;
}

export type LinkTempData = {
  query: QueryParams;
  date: Date;
  swap_id?: string;
}

export function OpenLink({ link, swapId, query }: OpenLinkArgs): (Window | null) {
  if (isMobile()) {
    const link_temp_data: LinkTempData = { query, date: new Date(), swap_id: swapId }
    setTempData(link_temp_data)
    window.location.href = link;
    return null
  }
  const authWindow = window.open(link, '_blank', 'width=420,height=720')
  return authWindow
}

export function isMobile(opts?: any) {
  if (!opts) opts = {}
  let ua = opts.ua
  if (!ua && typeof navigator !== 'undefined') ua = navigator.userAgent
  if (ua && ua.headers && typeof ua.headers['user-agent'] === 'string') {
    ua = ua.headers['user-agent']
  }
  if (typeof ua !== 'string') return false

  let result =
    (mobileRE.test(ua) && !notMobileRE.test(ua)) ||
    (!!opts.tablet && tabletRE.test(ua))

  if (
    !result &&
    opts.tablet &&
    opts.featureDetect &&
    navigator &&
    navigator.maxTouchPoints > 1 &&
    ua.indexOf('Macintosh') !== -1 &&
    ua.indexOf('Safari') !== -1
  ) {
    result = true
  }

  return result
}