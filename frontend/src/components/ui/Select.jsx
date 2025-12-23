import * as Select from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import { useState } from 'react';

export default function RoleSelect({ onChange }) {
  const [role, setRole] = useState("");

  return (
    <Select.Root
      value={role}
      onValueChange={(value) => {
        setRole(value);
        onChange && onChange(value);
      }}
    >
      <Select.Trigger
        className="
          w-full p-3 rounded-lg bg-white/20 text-white
          border-l-2 border-transparent outline-none
          focus:border-orange-500
          flex justify-between items-center cursor-pointer
        "
      >
        <Select.Value placeholder="Select Role" />
        <ChevronDownIcon className="text-white" />
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          side="bottom"
          align="start"
          alignOffset={40}
          sideOffset={6}
          className="
            bg-white/10 backdrop-blur-md text-white rounded-lg shadow-xl
            z-50
            min-w-(--radix-select-trigger-width)
            p-1
          "
        >
          <Select.Viewport>
            {["Bank", "Corporate", "Auditor", "Admin"].map((r) => (
              <Select.Item
                key={r}
                value={r.toLowerCase()}
                className="
                  px-4 py-2 mt-2 cursor-pointer rounded-md
                  data-highlighted:bg-white/20
                  data-highlighted:text-black
                  outline-none flex items-center justify-between
                "
              >
                <Select.ItemText>{r}</Select.ItemText>
                <Select.ItemIndicator>
                  <CheckIcon />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
