import { CalculatorWrapper } from '@/components/calculators/shared/CalculatorWrapper';
import { MirrorConfigurator } from '@/components/calculators/mirror/MirrorConfigurator';

export default function MirrorCalculator() {
  return (
    <CalculatorWrapper>
      <MirrorConfigurator />
    </CalculatorWrapper>
  );
}
