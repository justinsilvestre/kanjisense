import { DictLink } from "~/components/AppLink";
import { FigureBadge } from "~/components/FigureBadge";
import { BadgeProps } from "~/features/dictionary/badgeFigure";

export function FigureBadgeLink({
  figureKey,
  badgeProps,
  width,
  newWindow,
}: {
  figureKey: string;
  badgeProps: BadgeProps;
  width?: number;
  newWindow?: boolean;
}) {
  return (
    <DictLink figureKey={figureKey} newWindow={newWindow}>
      <FigureBadge badgeProps={badgeProps} width={width} />
    </DictLink>
  );
}
