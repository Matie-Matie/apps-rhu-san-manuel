import { Transition } from '@headlessui/react';
import {
    Fragment,
    PropsWithChildren,
} from 'react';

export default function Modal({
    children,
    show = false,
    onClose = () => {},
}: PropsWithChildren<{
    show: boolean;
    onClose: () => void;
}>) {
    const close = () => {
        onClose();
    };

    return (
        <Transition show={show} as={Fragment} leave="duration-200">
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-6 sm:px-0">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div
                        className="fixed inset-0 bg-black/40"
                        onClick={close}
                    />
                </Transition.Child>

                <Transition.Child
                    as={Fragment}
                    enter="ease-matie duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <div className="relative w-full max-w-lg rounded-[22px] border border-soil-200 bg-white p-6 shadow-modal">
                        {children}
                    </div>
                </Transition.Child>
            </div>
        </Transition>
    );
}
