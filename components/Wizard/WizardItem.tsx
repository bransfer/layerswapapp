import { motion } from 'framer-motion';
import { FC, useEffect } from 'react'
import { useFormWizardaUpdate, useFormWizardState } from '../../context/formWizardProvider';
import { Steps } from '../../Models/Wizard';

type Props = {
    StepName: Steps,
    PositionPercent?: number,
    GoBack?: () => void,
    children: JSX.Element | JSX.Element[];
    fitHeight?: boolean,
    className?: string;
    inModal?: boolean;
}

const WizardItem: FC<Props> = (({ StepName, children, GoBack, PositionPercent, fitHeight = false, className, inModal }: Props) => {
    const { currentStepName, wrapperWidth, moving } = useFormWizardState()
    const { setGoBack, setPositionPercent } = useFormWizardaUpdate()
    const styleConfigs = fitHeight ? { width: `${wrapperWidth}px`, height: '100%' } : { width: `${wrapperWidth}px`, minHeight: inModal ? 'inherit' : '534px', height: '100%' }

    useEffect(() => {
        if (currentStepName === StepName) {
            setGoBack(GoBack)
            PositionPercent && setPositionPercent(PositionPercent)
        }
    }, [currentStepName, StepName])

    return currentStepName === StepName ?
        <motion.div
            whileInView="done"
            key={currentStepName as string}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            custom={{ direction: moving === "back" ? -1 : 1, width: wrapperWidth }}>
            <div style={styleConfigs} className={className}>
                {Number(wrapperWidth) > 1 && children}
            </div>
        </motion.div>
        : null
})

let variants = {
    enter: ({ direction, width }) => ({
        x: direction * width,
    }),
    center: {
        x: 0,
        transition: {
            duration: 0.2,
            when: "beforeChildren",
        },
    },
    exit: ({ direction, width }) => ({
        x: direction * -width,
    }),
};

export default WizardItem;