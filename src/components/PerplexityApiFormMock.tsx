
import React from 'react';

interface PerplexityApiFormProps {
  onApiKeySet: (key: string) => void;
}

const PerplexityApiFormMock = ({ onApiKeySet }: PerplexityApiFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const key = formData.get('apiKey') as string;
    if (key) {
      onApiKeySet(key);
    }
  };

  return (
    <div className="border p-4 rounded-lg bg-card">
      <h3 className="text-lg font-medium mb-4">Perplexity API Key</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-sm font-medium text-muted-foreground mb-1">
            Enter your API Key
          </label>
          <input
            type="text"
            id="apiKey"
            name="apiKey"
            className="w-full p-2 border rounded-md"
            placeholder="pk-xxxxx"
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80 transition-colors"
        >
          Set API Key
        </button>
      </form>
    </div>
  );
};

export default PerplexityApiFormMock;
