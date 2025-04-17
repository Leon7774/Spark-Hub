export const Footer = () => {
  return (
    <div className="flex items-center justify-center border-t text-xs bg-gray-100 h-[30px] w-full absolute slide-out-to-bottom-10 ">
      © {new Date().getFullYear()} Talemode. Spark-Hub is a product of Talemode.
    </div>
  );
};
