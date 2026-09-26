"use client";

import { motion } from "motion/react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { FieldDescription, FieldGroup } from "@workspace/ui/components/field";

import { useCompanyFormContext } from "../contexts/CompanyFormContext";
import { formAnimationVariants } from "../data/company-form.constants";
import { contextSections } from "../data/context-questions";
import { ContextQuestionField } from "../fields/ContextQuestionField";
import { GenerateDescriptionDialog } from "../GenerateDescriptionDialog";

export function BriefStep() {
  "use no memo";
  const { control, isPending } = useCompanyFormContext();

  return (
    <motion.div
      variants={formAnimationVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      key="brief-step-content"
    >
      <FieldDescription className="mb-4">
        All fields are optional. Expand a section and fill in what is known.
      </FieldDescription>

      <Accordion defaultValue={[contextSections[0]?.name ?? ""]}>
        {contextSections.map((section) => (
          <AccordionItem key={section.name} value={section.name}>
            <AccordionTrigger>
              <span className="flex flex-col text-start">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-sm text-foreground">
                    {section.title}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {`${section.questions.length} fields`}
                  </span>
                </div>
                <span className="text-xs font-normal text-muted-foreground">
                  {section.description}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <FieldGroup>
                {section.questions.map((question) => (
                  <ContextQuestionField
                    key={question.name}
                    question={question}
                    control={control}
                    disabled={isPending}
                  />
                ))}
              </FieldGroup>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <GenerateDescriptionDialog />
    </motion.div>
  );
}
