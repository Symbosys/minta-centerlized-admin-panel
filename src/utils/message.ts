import { AxiosError } from "axios";
import { toast } from "sonner";

export const showError = (error: AxiosError | Error | string) => {
    if (typeof error === "string") {
        toast.error(error);
    } else if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Something went wrong");
    } else {
        toast.error(error.message || "Something went wrong");
    }
};

export const showSuccess = (message: string) => {
    toast.success(message);
};

export const showInfo = (message: string) => {
    toast.info(message);
};

export const showWarning = (message: string) => {
    toast.warning(message);
};
