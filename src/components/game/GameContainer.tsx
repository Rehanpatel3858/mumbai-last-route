import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../../game/config';
import type { GameBridgeEvents } from '../../game/scenes/MainGameScene';
import { BootScene } from '../../game/scenes/BootScene';
import { MainGameScene } from '../../game/scenes/MainGameScene';
import { InteriorScene } from '../../game/scenes/InteriorScene';
import { FLOOD_PHASES, type FloodPhase } from '../../game/systems/FloodSystem';
import type { ScoreBreakdown } from '../../game/systems/ScoreSystem';
import { useGameState } from '../../context/GameStateContext';
import { GameHUD } from './GameHUD';
import { PauseModal } from './PauseModal';
import { VictoryModal } from './VictoryModal';
import { FailureModal } from './FailureModal';
import { MapOverlay } from './MapOverlay';

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
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [mapData, setMapData] = useState<any>(null);

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
      onToggleMap: (isOpen: boolean) => {
        setIsMapOpen(isOpen);
      },
      onMapUpdate: (data: any) => {
        setMapData(data);
      }
    };

    const config = createGameConfig(containerRef.current.id);
    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.scene.add('BootScene', BootScene);
    game.scene.add('MainGameScene', MainGameScene);
    game.scene.add('InteriorScene', InteriorScene);
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
          onToggleMap: (isOpen: boolean) => setIsMapOpen(isOpen),
          onMapUpdate: (data: any) => setMapData(data),
        },
      });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: 'black', overflow: 'hidden', flex: 1 }}>
      <div id="phaser-game-container" ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }} />

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

      {isMapOpen && <MapOverlay data={mapData} />}

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
