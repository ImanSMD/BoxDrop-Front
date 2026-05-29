export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white px-[22px] py-0">
      {children}
    </div>
  );
}
