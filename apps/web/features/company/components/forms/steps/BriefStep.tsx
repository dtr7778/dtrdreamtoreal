"use client";

import { motion } from "motion/react";
import { Control } from "react-hook-form";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { FieldDescription, FieldGroup } from "@workspace/ui/components/field";

import { CompanyCreateType } from "../../../company.schema";
import { formAnimationVariants } from "../CompanyCreateForm";
import { contextSections } from "../context/context-questions";
import { ContextQuestionField } from "../context/ContextQuestionField";

export function BriefStep({
  control,
  disabled,
}: {
  control: Control<CompanyCreateType>;
  disabled?: boolean;
}) {
  "use no memo";

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
                    disabled={disabled}
                  />
                ))}
              </FieldGroup>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  );
}
