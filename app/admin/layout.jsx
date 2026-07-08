import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "LetsCart. - Admin",
    description: "LetsCart. - Admin",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
