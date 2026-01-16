import 'package:flutter/material.dart';
import '../models/trading_account.dart';
import '../services/database_service.dart';
import '../theme/app_theme.dart';

class AccountsScreen extends StatefulWidget {
  const AccountsScreen({super.key});

  @override
  State<AccountsScreen> createState() => _AccountsScreenState();
}

class _AccountsScreenState extends State<AccountsScreen> {
  List<TradingAccount> _accounts = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadAccounts();
  }

  Future<void> _loadAccounts() async {
    setState(() => _loading = true);
    try {
      final accounts = await DatabaseService.getAccounts();
      setState(() {
        _accounts = accounts;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  void _showAddEditDialog([TradingAccount? account]) {
    final isEdit = account != null;
    final nameController = TextEditingController(text: account?.name ?? '');
    final brokerController = TextEditingController(text: account?.broker ?? '');
    final sizeController = TextEditingController(
      text: account?.accountSize?.toString() ?? '',
    );
    final notesController = TextEditingController(text: account?.notes ?? '');
    String selectedType = account?.accountType ?? AccountType.personal;
    String selectedStatus = account?.status ?? AccountStatus.active;
    String selectedCurrency = account?.currency ?? 'USD';

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: AppTheme.bgSecondary,
          title: Text(isEdit ? 'Edit Account' : 'Add Account'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(labelText: 'Account Name *'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: brokerController,
                  decoration: const InputDecoration(labelText: 'Broker'),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: selectedType,
                  decoration: const InputDecoration(labelText: 'Account Type'),
                  items: AccountType.all.map((type) => DropdownMenuItem(
                    value: type,
                    child: Text(AccountType.displayName(type)),
                  )).toList(),
                  onChanged: (val) => setDialogState(() => selectedType = val!),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: sizeController,
                  decoration: const InputDecoration(labelText: 'Account Size'),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: selectedCurrency,
                  decoration: const InputDecoration(labelText: 'Currency'),
                  items: ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'].map((c) => 
                    DropdownMenuItem(value: c, child: Text(c))
                  ).toList(),
                  onChanged: (val) => setDialogState(() => selectedCurrency = val!),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: selectedStatus,
                  decoration: const InputDecoration(labelText: 'Status'),
                  items: AccountStatus.all.map((status) => DropdownMenuItem(
                    value: status,
                    child: Text(status),
                  )).toList(),
                  onChanged: (val) => setDialogState(() => selectedStatus = val!),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: notesController,
                  decoration: const InputDecoration(labelText: 'Notes'),
                  maxLines: 2,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                if (nameController.text.trim().isEmpty) return;
                
                final newAccount = TradingAccount(
                  id: account?.id ?? '',
                  name: nameController.text.trim(),
                  broker: brokerController.text.trim().isEmpty ? null : brokerController.text.trim(),
                  accountType: selectedType,
                  accountSize: double.tryParse(sizeController.text),
                  currency: selectedCurrency,
                  status: selectedStatus,
                  notes: notesController.text.trim().isEmpty ? null : notesController.text.trim(),
                  createdAt: account?.createdAt ?? DateTime.now(),
                  updatedAt: DateTime.now(),
                );
                
                if (isEdit) {
                  await DatabaseService.updateAccount(newAccount);
                } else {
                  await DatabaseService.createAccount(newAccount);
                }
                
                if (mounted) Navigator.pop(context);
                _loadAccounts();
              },
              child: Text(isEdit ? 'Save' : 'Add'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _deleteAccount(TradingAccount account) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppTheme.bgSecondary,
        title: const Text('Delete Account?'),
        content: Text('Are you sure you want to delete "${account.name}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    
    if (confirmed == true) {
      await DatabaseService.deleteAccount(account.id);
      _loadAccounts();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  const Text('🏦', style: TextStyle(fontSize: 28)),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text('Trading Accounts', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                  ),
                  IconButton(
                    onPressed: () => _showAddEditDialog(),
                    icon: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppTheme.accent,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.add, color: Colors.white, size: 20),
                    ),
                  ),
                ],
              ),
            ),
            
            // Content
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : _accounts.isEmpty
                      ? _buildEmptyState()
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          itemCount: _accounts.length,
                          itemBuilder: (context, index) => _buildAccountCard(_accounts[index]),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.account_balance_wallet_outlined, size: 64, color: AppTheme.textMuted),
          const SizedBox(height: 16),
          Text('No accounts yet', style: TextStyle(color: AppTheme.textMuted, fontSize: 18)),
          const SizedBox(height: 8),
          Text('Add your first trading account', style: TextStyle(color: AppTheme.textMuted)),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: () => _showAddEditDialog(),
            icon: const Icon(Icons.add),
            label: const Text('Add Account'),
          ),
        ],
      ),
    );
  }

  Widget _buildAccountCard(TradingAccount account) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.bgTertiary,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  account.displayName,
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                ),
              ),
              PopupMenuButton<String>(
                onSelected: (val) {
                  if (val == 'edit') _showAddEditDialog(account);
                  if (val == 'delete') _deleteAccount(account);
                },
                itemBuilder: (context) => [
                  const PopupMenuItem(value: 'edit', child: Text('Edit')),
                  const PopupMenuItem(value: 'delete', child: Text('Delete', style: TextStyle(color: Colors.red))),
                ],
              ),
            ],
          ),
          if (account.broker != null) ...[
            const SizedBox(height: 4),
            Text(account.broker!, style: TextStyle(color: AppTheme.textMuted)),
          ],
          const SizedBox(height: 8),
          Row(
            children: [
              _buildChip(AccountType.displayName(account.accountType), AppTheme.accent),
              const SizedBox(width: 8),
              _buildChip(account.statusDisplay, _statusColor(account.status)),
              const Spacer(),
              if (account.accountSize != null)
                Text(
                  '${account.currency} ${account.accountSize!.toStringAsFixed(0)}',
                  style: TextStyle(color: AppTheme.textMuted, fontWeight: FontWeight.w500),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildChip(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(text, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w500)),
    );
  }

  Color _statusColor(String status) {
    return switch (status) {
      'ACTIVE' => Colors.green,
      'PASSED' => Colors.blue,
      'FAILED' => Colors.red,
      _ => Colors.grey,
    };
  }
}
