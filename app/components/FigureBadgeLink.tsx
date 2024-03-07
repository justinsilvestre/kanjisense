import { DictLink } from "~/components/AppLink";
import { FigureBadge } from "~/components/FigureBadge";
import { BadgeProps } from "~/features/dictionary/badgeFigure";

export function FigureBadgeLink({
  id: figureId,
  badgeProps,
  width,
  newWindow,
}: {
  id: string;
  badgeProps: BadgeProps;
  width?: number;
  newWindow?: boolean;
}) {
  return (
    <DictLink figureId={figureId} newWindow={newWindow}>
      <FigureBadge badgeProps={badgeProps} width={width} />
    </DictLink>
  );
}
