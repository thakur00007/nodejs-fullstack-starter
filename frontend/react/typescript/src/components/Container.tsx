function Container({ children }: React.PropsWithChildren<unknown>) {
  return (
    <div className="w-full min-h-screen mx-auto p-2 bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
}

export default Container;
