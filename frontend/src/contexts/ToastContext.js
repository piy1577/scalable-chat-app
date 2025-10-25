import { Toast } from "primereact/toast";
import { createContext, useContext, useRef } from "react";

const toastContext = createContext();

const ToastProvider = ({ children }) => {
    const toast = useRef(null);

    const showSuccess = (title, message) => {
        toast.current?.show({
            severity: "success",
            summary: title,
            detail: message,
            life: 3000,
            closable: true,
        });
    };

    const showError = (title, message) => {
        toast.current?.show({
            severity: "error",
            summary: title,
            detail: message,
            life: 3000,
            closable: true,
        });
    };

    return (
        <toastContext.Provider
            value={{ success: showSuccess, error: showError }}
        >
            <Toast ref={toast} position="top-right" />
            {children}
        </toastContext.Provider>
    );
};

export const useToast = () => useContext(toastContext);

export default ToastProvider;
