import type { MetaFunction } from "@remix-run/node";
import { ReactNode } from "react";

import {
  BrowseAtomicComponentsLink,
  BrowseSoundComponentsLink,
} from "~/components/AppLink";
import DictionaryLayout from "~/components/DictionaryLayout";
import { FigurePopoverBadge } from "~/components/FigurePopover";
import { BadgeHue, BadgeProps } from "~/features/dictionary/badgeFigure";
import { TOTAL_ATOMIC_COMPONENTS_COUNT } from "~/features/dictionary/TOTAL_ATOMIC_COMPONENTS_COUNT";
import { getLatestFigureId } from "~/models/figure";

export const meta: MetaFunction = () => [{ title: "Kanjisense" }];

export default function Index({ error }: { error?: ReactNode }) {
  return (
    <DictionaryLayout>
      <>
        {error ? (
          <div className="border-1 mb-4 rounded-sm border border-red-700/20 p-8 text-center text-red-700">
            {error}
          </div>
        ) : null}
        <section className="mx-auto my-4 flex max-w-2xl flex-grow flex-col justify-center">
          <div className=" rounded-md bg-gray-300/10 p-2 shadow-lg shadow-black/20 md:m-2 md:p-4">
            <h1 className="mb-4 text-xl">
              Learn the kanji through{" "}
              <strong className="text-blue-800">components</strong> and{" "}
              <strong className="text-blue-800">connections</strong>.
            </h1>
            <p className="mb-4">
              Did you know it only takes{" "}
              <strong>{TOTAL_ATOMIC_COMPONENTS_COUNT} kanji components</strong>{" "}
              to form all the 3,500 most important kanji? Once you become
              familiar with{" "}
              <BrowseAtomicComponentsLink>
                these basic component shapes
              </BrowseAtomicComponentsLink>
              , each new kanji you encounter will change from a bunch of random
              squiggles into a combination of{" "}
              <strong>meaningful elements</strong>.
            </p>
            <div className="mx-auto mb-4 flex max-w-xl flex-row flex-wrap justify-evenly gap-4">
              <FigurePopoverBadge width={5} badgeProps={nichi} />
              <FigurePopoverBadge width={5} badgeProps={getsu} />
              <FigurePopoverBadge width={5} badgeProps={akarui} />
              <FigurePopoverBadge width={5} badgeProps={mei} />
            </div>
            <p className="mb-4">
              Enter a kanji in the form at the top to see its constituent
              components, including the helpful but frequently overlooked{" "}
              <BrowseSoundComponentsLink>
                sound components
              </BrowseSoundComponentsLink>
              . Each component is assigned a unique{" "}
              <strong>mnemonic keyword</strong> based on its historical meaning
              or its shape to help you keep it firmly in your memory.
            </p>
          </div>
        </section>
      </>
    </DictionaryLayout>
  );
}

const nichi: BadgeProps = {
  id: getLatestFigureId("日"),
  key: "日",
  image: {
    id: getLatestFigureId("日"),
    key: "日",
    version: 0,
    type: "Kvg",
    content: {
      n: [
        "matrix(1 0 0 1 25.25 32.63)",
        "matrix(1 0 0 1 34.50 22.50)",
        "matrix(1 0 0 1 37.50 51.50)",
        "matrix(1 0 0 1 37.50 83.50)",
      ],
      p: [
        "M31.5,24.5c1.12,1.12,1.74,2.75,1.74,4.75c0,1.6-0.16,38.11-0.09,53.5c0.02,3.82,0.05,6.35,0.09,6.75",
        "M33.48,26c0.8-0.05,37.67-3.01,40.77-3.25c3.19-0.25,5,1.75,5,4.25c0,4-0.22,40.84-0.23,56c0,3.48,0,5.72,0,6",
        "M34.22,55.25c7.78-0.5,35.9-2.5,44.06-2.75",
        "M34.23,86.5c10.52-0.75,34.15-2.12,43.81-2.25",
      ],
    },
  },
  aozoraAppearances: 4843808,
  listsAsCharacter: ["j", "1"],
  listsAsComponent: ["j", "3", "1", "4", "6", "5", "m", "h", "2"],
  hue: BadgeHue.KYOIKU,
  isStandaloneCharacter: true,
  isPriorityComponent: true,
  variantGroupId: null,
  isPrioritySoundMark: true,
};
const getsu: BadgeProps = {
  id: getLatestFigureId("月"),
  key: "月",
  image: {
    id: getLatestFigureId("月"),
    key: "月",
    version: 0,
    type: "Kvg",
    content: {
      n: [
        "matrix(1 0 0 1 27.50 23.43)",
        "matrix(1 0 0 1 37.50 15.50)",
        "matrix(1 0 0 1 40.00 33.50)",
        "matrix(1 0 0 1 40.00 54.50)",
      ],
      p: [
        "M34.25,16.25c1,1,1.48,2.38,1.5,4c0.38,33.62,2.38,59.38-11,73.25",
        "M36.25,19c4.12-0.62,31.49-4.78,33.25-5c4-0.5,5.5,1.12,5.5,4.75c0,2.76-0.5,49.25-0.5,69.5c0,13-6.25,4-8.75,1.75",
        "M37.25,38c10.25-1.5,27.25-3.75,36.25-4.5",
        "M37,58.25c8.75-1.12,27-3.5,36.25-4",
      ],
    },
  },
  aozoraAppearances: 1634235,
  listsAsCharacter: ["j", "1"],
  listsAsComponent: ["j", "6", "3", "m", "h", "5", "4", "1", "2"],
  hue: BadgeHue.KYOIKU,
  isStandaloneCharacter: true,
  isPriorityComponent: true,
  variantGroupId: getLatestFigureId("月"),
  isPrioritySoundMark: true,
};
const akarui: BadgeProps = {
  id: getLatestFigureId("明"),
  key: "明",
  image: {
    id: getLatestFigureId("明"),
    key: "明",
    version: 1,
    type: "Kvg",
    content: {
      n: [
        "matrix(1 0 0 1 9.50 28.63)",
        "matrix(1 0 0 1 20.50 24.13)",
        "matrix(1 0 0 1 22.50 42.13)",
        "matrix(1 0 0 1 22.50 63.13)",
        "matrix(1 0 0 1 50.50 24.13)",
        "matrix(1 0 0 1 60.50 15.00)",
        "matrix(1 0 0 1 63.50 36.00)",
        "matrix(1 0 0 1 63.50 54.50)",
      ],
      p: [
        "M16.75,25.22c0.89,0.89,1.32,2.29,1.32,3.66c0,1.11,0.07,27.44,0,37.63c-0.02,2.32-0.02,3.78-0.02,3.91",
        "M19.29,27.75c5.66-0.81,19.54-2.59,21.22-2.75c1.76-0.17,2.89,1.89,2.75,2.91c-0.23,1.7-0.45,27.34-0.52,36.6c-0.01,1.9-0.02,3.11-0.02,3.29",
        "M19.16,46.97C23.5,46.5,37,45.12,41.77,44.76",
        "M19,66.59c8.5-0.97,14.37-1.59,22.49-2.11",
        "M57.55,16c0.95,1.25,1.09,2.48,1.11,3.5c1.09,49.25-4.41,64.75-17.41,75.75",
        "M59.5,17.98c6.56-1.04,21.76-3.51,23.07-3.73c2.97-0.5,5.21,0.62,5.21,4.5c0,1.49,0.19,50.25,0.19,70.5c0,11.88-7.22,3.5-8.3,2.5",
        "M59.77,39c7.85-1,19.73-2.25,26.95-2.75",
        "M59.25,57.75c6.62-0.62,20-1.5,27.36-2",
      ],
    },
  },
  aozoraAppearances: 114985,
  listsAsCharacter: ["j", "2"],
  listsAsComponent: ["j", "6", "m"],
  hue: BadgeHue.KYOIKU,
  isStandaloneCharacter: true,
  isPriorityComponent: true,
  variantGroupId: null,
  isPrioritySoundMark: true,
};
const mei: BadgeProps = {
  id: getLatestFigureId("盟"),
  key: "盟",
  image: {
    id: getLatestFigureId("盟"),
    key: "盟",
    version: 1,
    type: "Kvg",
    content: {
      n: [
        "matrix(1 0 0 1 17.25 28.63)",
        "matrix(1 0 0 1 26.50 17.50)",
        "matrix(1 0 0 1 29.25 32.50)",
        "matrix(1 0 0 1 29.25 47.98)",
        "matrix(1 0 0 1 53.50 22.63)",
        "matrix(1 0 0 1 63.75 12.50)",
        "matrix(1 0 0 1 66.75 25.55)",
        "matrix(1 0 0 1 66.71 37.50)",
        "matrix(1 0 0 1 20.50 77.50)",
        "matrix(1 0 0 1 30.75 68.50)",
        "matrix(1 0 0 1 36.50 81.05)",
        "matrix(1 0 0 1 52.50 79.50)",
        "matrix(1 0 0 1 3.50 95.50)",
      ],
      p: [
        "M23.04,19.27c0.84,0.84,1.27,1.73,1.27,3.22c0,3.75,0.04,21.88,0.04,25.75c0,3.2-0.04,5.42-0.04,5.55",
        "M25.19,21.42c4.18-0.54,17.43-2.5,19.41-2.65c1.65-0.13,2.58,0.98,2.58,2.72c0,2.76,0.13,16.23,0.04,24.76c-0.03,3.25-0.05,5.55-0.05,5.77",
        "M25.58,35.83c4.05-0.33,17.14-2.13,20.45-2.13",
        "M25.44,50.92c7.93-0.79,13.79-1.64,20.58-1.87",
        "M59.91,13.72c0.81,0.81,1.2,1.91,1.25,3.28C62,40.88,59.25,52.75,49.32,62.75",
        "M61.91,15.56c1.99-0.15,21.24-2.5,22.73-2.58c2.12-0.11,3.32,0.77,3.32,2.82c0,3.45,0,27.85,0,39.88c0,9.06-6.46,1.93-7.44,1.34",
        "M62.66,29.03c6.84-0.78,18.41-1.74,24.39-2.18",
        "M61.19,41.22c5.32-0.45,19.63-1.34,25.77-1.64",
        "M27.34,70.6c0.97,0.97,1.34,1.76,1.44,2.77s1.47,13,2.07,19.63",
        "M29.57,72.13c10.67-0.75,37.1-3.03,46.93-3.88c4.23-0.37,6,1.12,4.89,6.04c-0.96,4.24-2.18,10-3.66,16.65",
        "M44.36,72.12c0.63,0.63,1.13,1.37,1.19,2.45c0.2,3.56,0.57,10.69,1.1,17.34",
        "M62.9,70.87c0.49,0.49,0.8,1.7,0.73,2.36c-0.38,3.15-1,11.15-1.89,18.42",
        "M13.88,94.23c3,0.52,6.65,0.81,9.75,0.55C40,93.38,62.5,92,86.88,91.09c3.58-0.13,7.23-0.03,10.75,0.73",
      ],
    },
  },
  aozoraAppearances: 3233,
  listsAsCharacter: ["j", "6"],
  listsAsComponent: [],
  hue: BadgeHue.KYOIKU,
  isStandaloneCharacter: true,
  isPriorityComponent: false,
  variantGroupId: null,
  isPrioritySoundMark: false,
};
