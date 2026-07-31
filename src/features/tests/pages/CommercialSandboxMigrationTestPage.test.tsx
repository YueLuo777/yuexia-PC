import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CommercialSandboxMigrationTestPage } from './CommercialSandboxMigrationTestPage';
import { testGroups } from './testCollectionGroups';
import { readTestCollectionSource } from './testCollectionSource.testUtils';

describe('CommercialSandboxMigrationTestPage', () => {
  it('keeps the commercial sandbox registered as test 38', () => {
    const uiGroup = testGroups.find((group) => group.title === 'UI 与主题');
    expect(uiGroup?.items.find((item) => item.path === '/commercial-sandbox-migration-test')).toMatchObject({
      serial: 38,
      title: '用户系统与用户裂变本地沙箱',
      path: '/commercial-sandbox-migration-test',
    });

    const source = readTestCollectionSource();
    expect(source).toContain('const CommercialSandboxMigrationTestPage = lazy(() =>');
    expect(source).toContain("case '/commercial-sandbox-migration-test':");
  });

  it('marks the prototype as local-only and opens a membership plan without real payment', () => {
    render(<CommercialSandboxMigrationTestPage />);

    expect(screen.getByTestId('commercial-sandbox-migration-test')).toHaveAttribute('data-sandbox-scope', 'local-only');
    expect(screen.getAllByText(/本地商业系统沙箱/).length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getAllByRole('button', { name: '模拟开通' })[1]);

    expect(screen.getByRole('button', { name: /测试用户A/ })).toHaveTextContent('入门会员');
    expect(screen.getByRole('button', { name: /测试用户A/ })).toHaveTextContent('可用 1000');
    expect(screen.getByText('grant')).toBeInTheDocument();
  });

  it('freezes points before a task and settles only the actual usage', () => {
    render(<CommercialSandboxMigrationTestPage />);

    fireEvent.click(screen.getAllByRole('button', { name: '模拟开通' })[1]);
    fireEvent.click(screen.getByRole('button', { name: '创建报价' }));
    fireEvent.click(screen.getByRole('button', { name: '冻结' }));
    expect(screen.getByRole('button', { name: /测试用户A/ })).toHaveTextContent('冻结 180');

    fireEvent.click(screen.getByRole('button', { name: '成功结算' }));
    expect(screen.getByRole('button', { name: /测试用户A/ })).toHaveTextContent('可用 855');
    expect(screen.getByRole('button', { name: /测试用户A/ })).toHaveTextContent('冻结 0');
    expect(screen.getByText('settle')).toBeInTheDocument();
  });

  it('runs one-level invite rewards through observation and refund revocation', () => {
    render(<CommercialSandboxMigrationTestPage />);

    fireEvent.click(screen.getByRole('button', { name: 'B 绑定 A' }));
    fireEvent.click(screen.getByRole('button', { name: 'B 首次付费' }));
    expect(screen.getByText('待生效').closest('div')).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: '观察期结束' }));
    expect(screen.getByText('已生效').closest('div')).toHaveTextContent('1');
    expect(screen.getByRole('button', { name: /测试用户A/ })).toHaveTextContent('可用 200');

    fireEvent.click(screen.getByRole('button', { name: '退款撤回' }));
    expect(screen.getByText('已撤回').closest('div')).toHaveTextContent('1');
    expect(screen.getByRole('button', { name: /测试用户A/ })).toHaveTextContent('可用 0');
    const ledgerPanel = screen.getByText('追加式积分账本').closest('section');
    expect(ledgerPanel).toBeTruthy();
    expect(within(ledgerPanel as HTMLElement).getByText('invite-revoke')).toBeInTheDocument();
  });
});
