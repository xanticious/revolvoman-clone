interface ControlButtonProps {
  onClick: () => void;
  disabled: boolean;
  className: string;
  children: React.ReactNode;
}

function ControlButton({
  onClick,
  disabled,
  className,
  children,
}: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`${className} disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg text-xl`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

interface MobileControlsProps {
  isInputDisabled: boolean;
  gameState: {
    isGameRunning: boolean;
    isPlayerFalling: boolean;
    isRotating: boolean;
    timeRemaining: number;
    isGameOver: boolean;
  };
  formatTime: () => string;
  handleMobileInput: (key: string) => void;
}

export default function MobileControls({
  isInputDisabled,
  gameState,
  formatTime,
  handleMobileInput,
}: MobileControlsProps) {
  const isButtonDisabled = (additionalCondition?: boolean) =>
    isInputDisabled ||
    !gameState.isGameRunning ||
    gameState.isRotating ||
    additionalCondition ||
    false;

  return (
    <div className="max-w-4xl mx-auto mt-28">
      <div className="flex justify-between items-center">
        {/* Left Controls */}
        <div className="flex space-x-4">
          <ControlButton
            onClick={() => handleMobileInput('ArrowLeft')}
            disabled={isButtonDisabled(gameState.isPlayerFalling)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            ◄
          </ControlButton>
          <ControlButton
            onClick={() => handleMobileInput('s')}
            disabled={isButtonDisabled()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            ↺
          </ControlButton>
        </div>

        {/* Center - Timer */}
        <div className="flex flex-col items-center justify-end">
          <div className="text-2xl font-bold">
            <span
              className={`${
                gameState.timeRemaining <= 5 && !gameState.isGameOver
                  ? 'text-red-400 animate-pulse'
                  : 'text-cyan-400'
              }`}
            >
              {formatTime()}
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex space-x-4">
          <ControlButton
            onClick={() => handleMobileInput('d')}
            disabled={isButtonDisabled()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            ↻
          </ControlButton>
          <ControlButton
            onClick={() => handleMobileInput('ArrowRight')}
            disabled={isButtonDisabled(gameState.isPlayerFalling)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            ►
          </ControlButton>
        </div>
      </div>
    </div>
  );
}
