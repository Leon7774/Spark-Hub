export const Content = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-[200vh] rounded-lg bg-background p-10 pb-4 shadow">
      {children}
    </div>
  );
};
