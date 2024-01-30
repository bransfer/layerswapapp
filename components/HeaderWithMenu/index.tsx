import { useIntercom } from "react-use-intercom"
import { useAuthState } from "../../context/authContext"
import IconButton from "../buttons/iconButton"
import GoHomeButton from "../utils/GoHome"
import { ArrowLeft } from 'lucide-react'
import ChatIcon from "../icons/ChatIcon"
import dynamic from "next/dynamic"
import LayerswapMenu from "../LayerswapMenu"
import { useQueryState } from "../../context/query"

const WalletsHeader = dynamic(() => import("../ConnectedWallets").then((comp) => comp.WalletsHeader), {
   loading: () => <></>
})

function HeaderWithMenu({ goBack }: { goBack: (() => void) | undefined | null }) {
   const { email, userId } = useAuthState()
   const { boot, show, update } = useIntercom()
   const updateWithProps = () => update({ email: email, userId: userId })
   const query = useQueryState()

   return (
      <div className="w-full grid grid-cols-5 px-6 mt-3" >
         {
            goBack &&
            <IconButton onClick={goBack}
               aria-label="Go back"
               icon={
                  <ArrowLeft strokeWidth="3" />
               }>
            </IconButton>
         }
         {
            !query.hideLogo && <div className='justify-self-center self-center col-start-2 col-span-3 mx-auto overflow-hidden md:hidden'>
               <GoHomeButton />
            </div>
         }
         <div className="col-start-5 justify-self-end self-center flex items-center gap-4">
            <WalletsHeader />
            <IconButton className="relative hidden md:inline" onClick={() => {
               boot();
               show();
               updateWithProps()
            }}
               icon={
                  <ChatIcon className="h-6 w-6" strokeWidth="2" />
               }>
            </IconButton>
            <div className="fixed-width-container">
               <LayerswapMenu />
            </div>
         </div>
      </div>
   )
}

export default HeaderWithMenu