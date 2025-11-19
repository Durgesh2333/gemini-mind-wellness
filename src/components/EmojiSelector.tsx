import { Button } from "@/components/ui/button";

interface EmojiSelectorProps {
  selectedEmoji: string | null;
  onSelect: (emoji: string) => void;
}

const emojis = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😟", label: "Worried" },
  { emoji: "😰", label: "Stressed" },
  { emoji: "😫", label: "Overwhelmed" },
];

export default function EmojiSelector({ selectedEmoji, onSelect }: EmojiSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {emojis.map(({ emoji, label }) => (
        <Button
          key={emoji}
          type="button"
          variant={selectedEmoji === emoji ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(emoji)}
          className="text-2xl h-12 w-12 p-0"
          title={label}
        >
          {emoji}
        </Button>
      ))}
    </div>
  );
}
