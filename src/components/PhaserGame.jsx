import {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import { IonPhaser } from "@ion-phaser/react";
import gameConfig, { getSceneInstance } from "@/game/config";

const PhaserGame = forwardRef(
  ({ onScoreChange, onGameOver, onGameReady }, ref) => {
    const phaserRef = useRef(null);
    const sceneRef = useRef(null);
    const [gameInstance, setGameInstance] = useState(null);

    const getScene = useCallback(() => {
      // Return cached scene if available
      if (sceneRef.current) {
        return sceneRef.current;
      }
      
      // Try to get scene from global reference first (most reliable)
      const globalScene = getSceneInstance();
      if (globalScene) {
        sceneRef.current = globalScene;
        return globalScene;
      }
      
      // Fallback: Try to get scene from game instance
      if (!gameInstance) {
        return null;
      }

      try {
        // Access the scene manager
        const sceneManager = gameInstance.scene;
        if (!sceneManager) {
          return null;
        }

        // Try getScene method
        if (typeof sceneManager.getScene === 'function') {
          const scene = sceneManager.getScene("EndlessRunnerScene");
          if (scene) {
            sceneRef.current = scene;
            return scene;
          }
        }

        // Try getScenes method (returns array)
        if (typeof sceneManager.getScenes === 'function') {
          const scenes = sceneManager.getScenes();
          const scene = scenes.find(s => s.scene && s.scene.key === "EndlessRunnerScene");
          if (scene && scene.scene) {
            sceneRef.current = scene.scene;
            return scene.scene;
          }
        }

        // Try scenes property (array of scene entries)
        if (sceneManager.scenes && Array.isArray(sceneManager.scenes)) {
          for (const sceneEntry of sceneManager.scenes) {
            if (sceneEntry && sceneEntry.scene && sceneEntry.scene.key === "EndlessRunnerScene") {
              sceneRef.current = sceneEntry.scene;
              return sceneEntry.scene;
            }
          }
        }
      } catch (e) {
        console.warn("Could not get scene:", e);
      }
      
      return null;
    }, [gameInstance]);

    // Wait for game to be initialized
    useEffect(() => {
      const findScene = (game) => {
        // First try global reference
        const globalScene = getSceneInstance();
        if (globalScene) {
          return globalScene;
        }
        
        try {
          // Try multiple access patterns
          if (game.scene && typeof game.scene.getScene === 'function') {
            return game.scene.getScene("EndlessRunnerScene");
          }
          if (game.scene && game.scene.scenes) {
            const sceneEntry = game.scene.scenes.find(s => s.scene && s.scene.key === "EndlessRunnerScene");
            return sceneEntry?.scene || null;
          }
          return null;
        } catch (e) {
          return null;
        }
      };

      const checkGame = () => {
        // Try different ways to get the game instance from IonPhaser
        let game = null;
        
        if (phaserRef.current) {
          // Method 1: Direct game property
          game = phaserRef.current.game;
          
          // Method 2: Try getInstance method
          if (!game && typeof phaserRef.current.getInstance === 'function') {
            game = phaserRef.current.getInstance();
          }
          
          // Method 3: Try accessing through internal structure
          if (!game && phaserRef.current._game) {
            game = phaserRef.current._game;
          }
        }
        
        if (game && !gameInstance) {
          console.log("Game instance found:", game);
          console.log("Game.scene:", game.scene);
          console.log("Game.scene type:", typeof game.scene);
          if (game.scene) {
            console.log("Scene methods:", Object.keys(game.scene));
            console.log("Scene.scenes:", game.scene.scenes);
          }
          
          setGameInstance(game);
          
          // Wait for scenes to be ready - try multiple times
          let attempts = 0;
          const findSceneInterval = setInterval(() => {
            attempts++;
            // Check global reference first (set when scene.create() runs)
            const globalScene = getSceneInstance();
            const scene = globalScene || findScene(game);
            
            if (scene) {
              clearInterval(findSceneInterval);
              sceneRef.current = scene;
              console.log("Scene found and cached:", scene);
              onGameReady?.({ game, scene });
            } else if (attempts > 50) {
              // Give up after 5 seconds
              clearInterval(findSceneInterval);
              console.warn("Scene not found after multiple attempts");
            }
          }, 100);
        }
      };

      checkGame();
      const interval = setInterval(checkGame, 100);
      
      return () => clearInterval(interval);
    }, [gameInstance, onGameReady]);

    // Set up event listeners once scene is available
    useEffect(() => {
      // Poll for scene to become available
      const setupListeners = () => {
        const scene = getSceneInstance() || getScene();
        if (!scene || !scene.events) {
          return false;
        }

        const handleScore = (value) => {
          onScoreChange?.(value);
        };

        const handleGameOver = (value) => {
          onGameOver?.(value);
        };

        // Remove old listeners if any
        scene.events.off("score-change", handleScore);
        scene.events.off("game-over", handleGameOver);
        
        // Add new listeners
        scene.events.on("score-change", handleScore);
        scene.events.on("game-over", handleGameOver);
        
        return true;
      };

      // Try to set up immediately
      if (setupListeners()) {
        return;
      }

      // If scene not ready, poll for it
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (setupListeners() || attempts > 50) {
          clearInterval(interval);
        }
      }, 100);

      return () => {
        clearInterval(interval);
        const scene = getSceneInstance() || getScene();
        if (scene && scene.events) {
          scene.events.off("score-change");
          scene.events.off("game-over");
        }
      };
    }, [onGameOver, onScoreChange]);

    useImperativeHandle(
      ref,
      () => ({
        getGame: () => gameInstance ?? null,
        getScore: () => {
          const scene = getSceneInstance() || getScene();
          return scene?.score ?? 0;
        },
        startGame: () => {
          const scene = getSceneInstance() || getScene();
          console.log("startGame called, scene:", scene);
          if (scene && typeof scene.startGame === 'function') {
            console.log("Calling scene.startGame()");
            scene.startGame();
          } else {
            console.warn("Scene or startGame method not available", {
              hasScene: !!scene,
              hasMethod: scene && typeof scene.startGame === 'function'
            });
          }
        },
        resetGame: () => {
          const scene = getSceneInstance() || getScene();
          if (scene && typeof scene.resetGame === 'function') {
            scene.resetGame();
          }
        },
      }),
      [gameInstance, getScene],
    );

    return (
      <div id="phaser-game-container" className="w-full h-full flex items-center justify-center">
        <IonPhaser ref={phaserRef} game={gameConfig} initialize />
      </div>
    );
  },
);

PhaserGame.displayName = "PhaserGame";

export default PhaserGame;

