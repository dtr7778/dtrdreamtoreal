import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  FileUpload,
  type FileUploadProps,
  useFileUploadState,
} from "./FileUpload";

const meta = {
  title: "UI/FileUpload",
  component: FileUpload,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "radio" },
      options: ["image", "document", "any"],
    },
    multiple: { control: { type: "boolean" } },
    disabled: { control: { type: "boolean" } },
    hideRemove: { control: { type: "boolean" } },
    accept: { control: { type: "text" } },
  },
  args: {
    variant: "any",
    multiple: false,
    disabled: false,
    hideRemove: false,
  },
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof FileUpload>;

function FileUploadStory(props: FileUploadProps) {
  const {
    fileValue,
    setFileValue,
    fileError,
    setFileError,
    uploadRef,
    uploadingProgress,
  } = useFileUploadState();

  return (
    <div className="max-w-lg w-full">
      <FileUpload
        {...props}
        ref={uploadRef}
        value={fileValue}
        onChange={setFileValue}
        uploadingProgress={uploadingProgress}
        onError={setFileError}
      />
      {fileError && <div className="text-destructive">{fileError}</div>}
    </div>
  );
}

/**
 * Default uploader. Accepts any file type up to the default max size (50 MB).
 */
export const Default: Story = {
  render: (args) => <FileUploadStory {...args} />,
};

/**
 * Multiple file selection.
 */
export const Multiple: Story = {
  args: {
    multiple: true,
  },
  render: (args) => <FileUploadStory {...args} />,
};

/**
 * Validation with a custom max size of 1 MB.
 */
export const WithMaxSizeValidation: Story = {
  args: {
    validation: { maxSize: 1 * 1024 * 1024 },
  },
  render: (args) => <FileUploadStory {...args} />,
};
