import { Context, createContext, useContext, useState } from 'react'

const StarknetModalContext = createContext<DataContextType | null>(null);

type DataContextType = {
    handleOpenModal: () => void,
    handleCloseModal: () => void,
    openModal: boolean
}

export function StarknetModalState({ children }) {

    const [openModal, setOpenModal] = useState(false)
    console.log(openModal)
    const handleOpenModal = () => {
        setOpenModal(true)
    }

    const handleCloseModal = () => {
        setOpenModal(false)
    }

    return (
        <StarknetModalContext.Provider value={{ handleOpenModal, handleCloseModal, openModal }}>
            {children}
        </StarknetModalContext.Provider>
    )
}

export function useStarknetModalState() {
    const data = useContext<DataContextType>(StarknetModalContext as Context<DataContextType>);

    if (data === null) {
        throw new Error('Cannot open Starknet modal');
    }

    return data;
}