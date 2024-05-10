function PlaybookBashActionOutput({ output }) {
  const outputs = output.command_outputs;
  return (
    <div className="max-w-xl overflow-scroll bg-white p-2 border rounded">
      {outputs.map((output) => (
        <p className="text-sm">
          <pre>{output.output}</pre>
        </p>
      ))}
    </div>
  );
}

export default PlaybookBashActionOutput;
