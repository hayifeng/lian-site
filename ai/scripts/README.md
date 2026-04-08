# AI开发脚本目录

## 用途
存放自动化脚本，用于：
1. 批量执行AI提示词任务
2. 代码生成自动化
3. 项目状态检查
4. 测试和验证

## 建议脚本
- `run_task.js` - 根据任务ID执行特定提示词
- `generate_component.js` - 自动生成React组件
- `validate_structure.js` - 验证项目结构符合规范
- `deploy_checklist.js` - 部署前检查清单

## 使用示例
```bash
# 运行前端任务F5
node scripts/run_task.js F5

# 生成环形展示组件
node scripts/generate_component.js CircularGallery
```

## 依赖
- Node.js 18+
- 可能需要AI API密钥（OpenAI/Anthropic等）
