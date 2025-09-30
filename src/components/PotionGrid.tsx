import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { POTIONS, shufflePotions, type Potion } from '@/lib/potions';
import { Check } from 'lucide-react';

interface PotionGridProps {
  selectedPotions: number[];
  onPotionSelect: (potionId: number) => void;
  disabled?: boolean;
}

export const PotionGrid = ({ selectedPotions, onPotionSelect, disabled = false }: PotionGridProps) => {
  const [shuffledPotions, setShuffledPotions] = useState<Potion[]>([]);

  useEffect(() => {
    // Shuffle potions on component mount to make it feel dynamic
    setShuffledPotions(shufflePotions(POTIONS));
  }, []);

  const isPotionSelected = (potionId: number) => selectedPotions.includes(potionId);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {shuffledPotions.map((potion) => {
        const isSelected = isPotionSelected(potion.id);
        return (
          <Card
            key={potion.id}
            className={`
              potion-card cursor-pointer transition-all duration-300 hover:scale-105 relative
              ${isSelected ? 'potion-selected border-magic-purple' : 'hover:shadow-lg'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={() => !disabled && onPotionSelect(potion.id)}
          >
            <CardContent className="p-4 text-center relative">
              {isSelected && (
                <div className="absolute top-2 right-2 bg-magic-purple rounded-full p-1">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
              
              <div className="mb-3 relative">
                <img
                  src={potion.image}
                  alt={potion.name}
                  className="w-16 h-16 mx-auto object-contain animate-float"
                  style={{
                    animationDelay: `${potion.id * 0.2}s`,
                  }}
                />
              </div>
              
              <h3 className="font-semibold text-sm mb-2 text-foreground">
                {potion.name}
              </h3>
              
              <p className="text-xs text-muted-foreground leading-tight">
                {potion.description}
              </p>
              
              {isSelected && (
                <div className="absolute inset-0 bg-magic-purple/10 rounded-lg flex items-center justify-center">
                  <div className="bg-magic-purple/80 text-white px-2 py-1 rounded text-xs font-medium">
                    Selected
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};