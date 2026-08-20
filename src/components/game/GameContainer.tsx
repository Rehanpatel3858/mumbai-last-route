import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../../game/config';
import type { GameBridgeEvents } from '../../game/scenes/MainGameScene';
import { FLOOD_PHASES, type FloodPhase } from '../../game/systems/FloodSystem';
import type { ScoreBreakdown } from '../../game/systems/ScoreSystem';
import { useGameState } from '../../context/GameStateContext';
import { GameHUD } from './GameHUD';
import { PauseModal } from './PauseModal';
import { VictoryModal } from './VictoryModal';
import { FailureModal } from './FailureModal';

export const GameContainer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  const { handleGameOver, activeScore, gameStatus, setGameStatus } = useGameState();

  const [timeRemaining, setTimeRemaining] = useState<number>(420);
  const [currentPhase, setCurrentPhase] = useState<FloodPhase>(FLOOD_PHASES[0]);
  const [rescuedCount, setRescuedCount] = useState<number>(0);
  const [totalCivilians, setTotalCivilians] = useState<number>(10);

  const [latestAlert, setLatestAlert] = useState<{
    sender: string;
    title: string;
    message: string;
    severity: string;
  } | null>(null);

  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const bridgeEvents: GameBridgeEvents = {
      onTimeUpdate: (secs: number) => setTimeRemaining(secs),
      onPhaseUpdate: (phase: FloodPhase) => setCurrentPhase(phase),
      onCiviliansUpdate: (rescued: number, total: number) => {
        setRescuedCount(rescued);
        setTotalCivilians(total);
      },
      onAlert: (sender: string, title: string, message: string, severity: 'INFO' | 'WARNING' | 'CRITICAL') => {
        setLatestAlert({ sender, title, message, severity });
        setTimeout(() => setLatestAlert(null), 5000);
      },
      onGameOver: (victory: boolean, score: ScoreBreakdown) => {
        handleGameOver(victory, score);
      },
    };

    const config = createGameConfig(containerRef.current.id);
    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.scene.start('BootScene', { eventsBridge: bridgeEvents });

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  const handleRestart = () => {
    setGameStatus('PLAYING');
    setIsPaused(false);
    if (gameRef.current) {
      gameRef.current.scene.stop('MainGameScene');
      gameRef.current.scene.start('BootScene', {
        eventsBridge: {
          onTimeUpdate: (secs: number) => setTimeRemaining(secs),
          onPhaseUpdate: (phase: FloodPhase) => setCurrentPhase(phase),
          onCiviliansUpdate: (rescued: number, total: number) => {
            setRescuedCount(rescued);
            setTotalCivilians(total);
          },
          onAlert: (sender: string, title: string, message: string, severity: 'INFO' | 'WARNING' | 'CRITICAL') => {
            setLatestAlert({ sender, title, message, severity });
            setTimeout(() => setLatestAlert(null), 5000);
          },
          onGameOver: (victory: boolean, score: ScoreBreakdown) => {
            handleGameOver(victory, score);
          },
        },
      });
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden" style={{ flex: 1 }}>
      <div id="phaser-game-container" ref={containerRef} className="absolute inset-0 w-full h-full" />

      <GameHUD
        timeRemainingSeconds={timeRemaining}
        currentPhase={currentPhase}
        rescuedCount={rescuedCount}
        totalCivilians={totalCivilians}
        latestAlert={latestAlert}
        onPause={() => setIsPaused(true)}
      />

      {isPaused && (
        <PauseModal
          onResume={() => setIsPaused(false)}
          onRestart={handleRestart}
        />
      )}

      {gameStatus === 'VICTORY' && activeScore && (
        <VictoryModal
          scoreBreakdown={activeScore}
          onPlayAgain={handleRestart}
        />
      )}

      {gameStatus === 'FAILURE' && (
        <FailureModal
          rescuedCount={rescuedCount}
          totalCivilians={totalCivilians}
          onRetry={handleRestart}
        />
      )}
    </div>
  );
};
