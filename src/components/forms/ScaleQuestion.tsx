"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface ScaleQuestionProps {
    value?: number;
    onChange?: (val: number) => void;
    disabled?: boolean;
}

export default function ScaleQuestion({ value, onChange, disabled }: ScaleQuestionProps) {
    // Generamos array [1, 2, 3, 4, 5]
    const levels = Array.from({ length: 5 }, (_, i) => i + 1);

    return (
        <div className="flex flex-col space-y-3 py-2">
            <div className="flex justify-between w-full px-2">
                <span className="text-xs text-muted-foreground">Muy en desacuerdo (1)</span>
                <span className="text-xs text-muted-foreground">Muy de acuerdo (5)</span>
            </div>
            <RadioGroup
                disabled={disabled}
                value={value?.toString()}
                onValueChange={(val) => onChange && onChange(parseInt(val))}
                className="flex justify-between w-full"
            >
                {levels.map((level) => (
                    <div key={level} className="flex flex-col items-center gap-2">
                        <RadioGroupItem
                            value={level.toString()}
                            id={`scale-${level}`}
                            className={cn(
                                "h-10 w-10 border-2 data-[state=checked]:border-primary data-[state=checked]:bg-primary/20",
                                disabled && "cursor-not-allowed opacity-50"
                            )}
                        />
                        <Label htmlFor={`scale-${level}`} className="font-bold text-sm text-gray-600">
                            {level}
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        </div>
    );
}