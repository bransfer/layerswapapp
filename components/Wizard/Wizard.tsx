import { FC, useEffect, useRef } from 'react'
import { useFormWizardaUpdate, useFormWizardState } from '../../context/formWizardProvider';
import { AnimatePresence } from 'framer-motion';
import HeaderWithMenu from '../HeaderWithMenu';

type Props = {
   children: JSX.Element | JSX.Element[];
   wizardId: string;
}

const Wizard: FC<Props> = ({ children, wizardId }) => {

   const wrapper = useRef<HTMLDivElement>(null);

   const { setWrapperWidth } = useFormWizardaUpdate()
   const { wrapperWidth, positionPercent, moving, goBack, noToolBar, hideMenu } = useFormWizardState()

   useEffect(() => {
      function handleResize() {
         if (wrapper.current !== null) {
            setWrapperWidth(wrapper.current.offsetWidth);
         }
      }
      window.addEventListener("resize", handleResize);
      handleResize();

      return () => window.removeEventListener("resize", handleResize);
   }, []);

   const width = positionPercent || 0
   return <>
      <div id='widget' className={noToolBar ? `w-full h-full` : ` bg-secondary-900 md:shadow-card rounded-lg w-full sm:overflow-hidden relative`}>
         <div className="relative">
            {!noToolBar && <div className="overflow-hidden h-1 flex rounded-t-lg bg-secondary-500">
               <div style={{ width: `${width}%`, transition: 'width 1s' }} className="shadow-none flex flex-col whitespace-nowrap justify-center bg-primary"></div>
            </div>}
         </div>
         {!hideMenu && <HeaderWithMenu goBack={goBack} />}
         <div className={noToolBar ? 'relative w-full h-full' : `relative px-6 `}>
            <div className="flex items-start w-full h-full"
               ref={wrapper}>
               <AnimatePresence initial={false} custom={{ direction: moving === "forward" ? 1 : -1, width: wrapperWidth }}>
                  <div className={`flex flex-nowrap h-full`} key={wizardId}>
                     {children}
                  </div>
               </AnimatePresence>
            </div>
         </div>
         <div id="widget_root" />
      </div>
   </>
}

export default Wizard;