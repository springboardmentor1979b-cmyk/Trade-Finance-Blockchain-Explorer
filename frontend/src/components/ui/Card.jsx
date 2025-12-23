function Card({ children }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg shadow-lg border border-white/10 
                    p-8 rounded-2xl w-full max-w-md">
      {children}
    </div>
  );
}

export default Card;
