import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "LetsCart. - Store Dashboard",
    description: "LetsCart. - Store Dashboard",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <StoreLayout>
                {children}
            </StoreLayout>
        </>
    );
}
