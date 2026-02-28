## Requirements Discovery: Popular Works Re-alignment

### Initial Request
"Tiêu đề đã lộ ra 1 ít, nhưng vẫn đang bị chê khuất bởi header, hãy căn chỉnh lại toàn bộ nội dung của popular works section, đảm bảo mọi thành phần đều có thể nhìn thấy rõ ràng và hài hoà." (The title has revealed a bit, but is still obscured by the header, please realign the entire content of the popular works section, ensuring all elements can be seen clearly and harmoniously.)

### Clarifying Questions
1. Q: Why is the title obscured?
   A: The `CumulativeSection` has a gradient overlay at the top (top-0) that covers elements underneath. Also, the global navigation header might be sticky at the top, occupying vertical space.
2. Q: What is the desired layout?
   A: The Popular Works title and the 3 book cards should be perfectly visible in the viewport, harmonious with the rest of the dark section, not cut off at the top or bottom.

### Problem Statement
The vertical centering applied previously put the mathematical center of the Popular Block in the physical center of the screen. However, this didn't account for the top navigation bar or the gradient overlay at the top of the `CumulativeSection`. As a result, the top of the Popular Block (the title) is hidden behind these top elements.

### Stakeholders
| Role   | Needs   | Priority |
| ------ | ------- | -------- |
| Users | Can read the "CÁC TÁC PHẨM PHỔ BIẾN" title and see the interactive cards without them being obscured | High    |

### Requirements
#### Functional
| ID  | Requirement | Priority       |
| --- | ----------- | -------------- |
| FR1 | The Popular Works content must be visible below the top header/overlay | Must |
| FR2 | The layout of title and cards must look visually balanced within the remaining viewport height | Must |

### Success Criteria
1. The title "CÁC TÁC PHẨM PHỔ BIẾN" is fully legible and not visually overlapping with the sticky header or top gradient.
2. The cards are not cut off at the bottom.

### Open Questions
- What is the exact height of the top header that we need to offset or add padding for?
