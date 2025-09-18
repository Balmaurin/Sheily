import ChatInterface from '@/components/chat/ChatInterface';

export default function ChatPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Chat con Llama-3.2-3B-Instruct-Q8_0
        </h1>
        <p className="text-muted-foreground">
          Interactúa con el modelo de inferencia rápida y genera archivos LoRA para entrenamiento
        </p>
      </div>
      
      <div className="h-[800px]">
        <ChatInterface 
          showLoRAGeneration={true}
          className="h-full"
        />
      </div>
    </div>
  );
}
